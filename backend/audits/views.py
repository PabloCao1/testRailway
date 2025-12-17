from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils.dateparse import parse_datetime
from .models import Establishment, Audit, AuditItem
from .serializers import EstablishmentSerializer, AuditSerializer, SyncPushSerializer

class EstablishmentViewSet(viewsets.ModelViewSet):
    queryset = Establishment.objects.all()
    serializer_class = EstablishmentSerializer
    permission_classes = [IsAuthenticated]

class AuditViewSet(viewsets.ModelViewSet):
    queryset = Audit.objects.all()
    serializer_class = AuditSerializer
    permission_classes = [IsAuthenticated]

class SyncPushView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SyncPushSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        audits_data = serializer.validated_data.get('audits', [])
        synced_ids = []
        
        try:
            with transaction.atomic():
                for audit_data in audits_data:
                    audit_id = audit_data.get('id')
                    client_updated_at = audit_data.get('updated_at')
                    
                    # Check if exists
                    existing_audit = Audit.objects.filter(id=audit_id).first()
                    
                    if existing_audit:
                        # Conflict Resolution: Server Wins if server is newer
                        # But we want to allow client update if client is newer
                        if client_updated_at > existing_audit.updated_at:
                            # Update logic
                            audit_serializer = AuditSerializer(existing_audit, data=audit_data, partial=True)
                            if audit_serializer.is_valid():
                                audit_serializer.save()
                                synced_ids.append(audit_id)
                        else:
                            # Server is newer or equal, ignore client update
                            # But we tell client it's synced so it stops sending it
                            synced_ids.append(audit_id)
                    else:
                        # Create new
                        # We need to ensure the serializer creates it with the provided UUID
                        audit_serializer = AuditSerializer(data=audit_data)
                        if audit_serializer.is_valid():
                            audit_serializer.save()
                            synced_ids.append(audit_id)
                        else:
                            print(f"Error syncing audit {audit_id}: {audit_serializer.errors}")

            return Response({'synced_ids': synced_ids}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SyncPullView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        last_sync = request.query_params.get('last_sync_timestamp')
        
        if last_sync:
            last_sync_dt = parse_datetime(last_sync)
            audits = Audit.objects.filter(updated_at__gt=last_sync_dt)
        else:
            audits = Audit.objects.all()
            
        serializer = AuditSerializer(audits, many=True)
        return Response({'audits': serializer.data})
