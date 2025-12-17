from rest_framework import serializers
from .models import Establishment, Audit, AuditItem, AuditPhoto
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class EstablishmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Establishment
        fields = '__all__'

class AuditItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditItem
        fields = ['id', 'question_key', 'is_compliant', 'value']

class AuditPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditPhoto
        fields = ['id', 'image', 'created_at']

class AuditSerializer(serializers.ModelSerializer):
    items = AuditItemSerializer(many=True, required=False)
    photos = AuditPhotoSerializer(many=True, read_only=True)
    establishment_name = serializers.CharField(source='establishment.name', read_only=True)

    class Meta:
        model = Audit
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        audit = Audit.objects.create(**validated_data)
        for item_data in items_data:
            AuditItem.objects.create(audit=audit, **item_data)
        return audit

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Update Audit fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Items (Simple strategy: Delete all and recreate for this demo, 
        # or update existing. For sync, we usually just overwrite).
        # A better sync strategy handles items individually, but for simplicity:
        if items_data:
            instance.items.all().delete()
            for item_data in items_data:
                AuditItem.objects.create(audit=instance, **item_data)
        
        return instance

class SyncPushSerializer(serializers.Serializer):
    audits = AuditSerializer(many=True)
