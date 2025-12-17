from django.contrib import admin
from .models import Establishment, Audit, AuditItem, AuditPhoto

class AuditItemInline(admin.TabularInline):
    model = AuditItem
    extra = 0

class AuditPhotoInline(admin.TabularInline):
    model = AuditPhoto
    extra = 0

@admin.register(Audit)
class AuditAdmin(admin.ModelAdmin):
    list_display = ('id', 'establishment', 'auditor', 'date', 'status', 'score')
    list_filter = ('status', 'date')
    inlines = [AuditItemInline, AuditPhotoInline]

@admin.register(Establishment)
class EstablishmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'address')
