from decimal import Decimal
from rest_framework import serializers
from .models import Invoice,InvoiceItem
class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta: model=InvoiceItem; fields=["id","description","quantity","unit_price","amount"]; read_only_fields=["id","amount"]
class InvoiceSerializer(serializers.ModelSerializer):
    patient_name=serializers.CharField(source="patient.full_name",read_only=True)
    items=InvoiceItemSerializer(many=True,required=False)
    class Meta:
        model=Invoice; fields=["id","invoice_number","patient","patient_name","issue_date","due_date","subtotal","tax","discount","total","paid_amount","status","notes","items","created_by","created_at","updated_at"]
        read_only_fields=["id","issue_date","patient_name","subtotal","total","created_by","created_at","updated_at"]
    def create(self,validated_data):
        items=validated_data.pop("items",[]); obj=Invoice.objects.create(**validated_data)
        for item in items: InvoiceItem.objects.create(invoice=obj,**item)
        self.recalculate(obj); return obj
    def update(self,instance,validated_data):
        items=validated_data.pop("items",None)
        for k,v in validated_data.items(): setattr(instance,k,v)
        instance.save()
        if items is not None:
            instance.items.all().delete()
            for item in items: InvoiceItem.objects.create(invoice=instance,**item)
        self.recalculate(instance); return instance
    def recalculate(self,obj):
        subtotal=sum((x.amount for x in obj.items.all()),Decimal("0"))
        obj.subtotal=subtotal; obj.total=max(Decimal("0"),subtotal+obj.tax-obj.discount)
        if obj.paid_amount>=obj.total and obj.total>0: obj.status="PAID"
        elif obj.paid_amount>0: obj.status="PARTIALLY_PAID"
        obj.save(update_fields=["subtotal","total","status","updated_at"])
