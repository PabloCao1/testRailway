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
        print(f"🔄 Sync Push Request from user: {request.user}")
        print(f"📦 Request data: {request.data}")
        
        try:
            serializer = SyncPushSerializer(data=request.data)
            if not serializer.is_valid():
                print(f"❌ Serializer validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            audits_data = serializer.validated_data.get('audits', [])
            print(f"📋 Processing {len(audits_data)} audits")
            synced_ids = []
            
            with transaction.atomic():
                for audit_data in audits_data:
                    audit_id = audit_data.get('id')
                    print(f"🔍 Processing audit: {audit_id}")
                    
                    # Simple create strategy for now
                    existing_audit = Audit.objects.filter(id=audit_id).first()
                    
                    if not existing_audit:
                        audit_serializer = AuditSerializer(data=audit_data)
                        if audit_serializer.is_valid():
                            audit_serializer.save()
                            synced_ids.append(audit_id)
                            print(f"✅ Created audit: {audit_id}")
                        else:
                            print(f"❌ Audit creation failed: {audit_serializer.errors}")
                    else:
                        synced_ids.append(audit_id)
                        print(f"⚠️ Audit already exists: {audit_id}")

            print(f"✅ Sync completed. Synced IDs: {synced_ids}")
            return Response({'synced_ids': synced_ids}, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"💥 Sync Push Error: {str(e)}")
            import traceback
            traceback.print_exc()
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
