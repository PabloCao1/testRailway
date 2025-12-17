import uuid
from django.db import models
from django.contrib.auth.models import User

class Establishment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Audit(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Borrador'),
        ('COMPLETED', 'Completada'),
        ('VALIDATED', 'Validada'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True) # Editable=True because client generates it
    auditor = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True)
    establishment = models.ForeignKey(Establishment, on_delete=models.PROTECT, null=True, blank=True)
    date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    score = models.IntegerField(default=0)
    observations = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.establishment.name} - {self.date}"

class AuditItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)
    audit = models.ForeignKey(Audit, related_name='items', on_delete=models.CASCADE)
    question_key = models.CharField(max_length=100)
    is_compliant = models.BooleanField()
    value = models.TextField(blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)

class AuditPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)
    audit = models.ForeignKey(Audit, related_name='photos', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='audit_photos/')
    created_at = models.DateTimeField(auto_now_add=True)
