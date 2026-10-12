from django.conf import settings
from django.db import models
from apps.patients.models import Patient

class Invoice(models.Model):
    class Status(models.TextChoices): DRAFT="DRAFT","Draft"; ISSUED="ISSUED","Issued"; PARTIALLY_PAID="PARTIALLY_PAID","Partially Paid"; PAID="PAID","Paid"; CANCELLED="CANCELLED","Cancelled"
    patient=models.ForeignKey(Patient,on_delete=models.CASCADE,related_name="invoices")
    invoice_number=models.CharField(max_length=50,unique=True)
    issue_date=models.DateField(auto_now_add=True)
    due_date=models.DateField(null=True,blank=True)
    subtotal=models.DecimalField(max_digits=12,decimal_places=2,default=0)
    tax=models.DecimalField(max_digits=12,decimal_places=2,default=0)
    discount=models.DecimalField(max_digits=12,decimal_places=2,default=0)
    total=models.DecimalField(max_digits=12,decimal_places=2,default=0)
    paid_amount=models.DecimalField(max_digits=12,decimal_places=2,default=0)
    status=models.CharField(max_length=20,choices=Status.choices,default=Status.DRAFT)
    notes=models.TextField(blank=True)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=["-created_at"]

class InvoiceItem(models.Model):
    invoice=models.ForeignKey(Invoice,on_delete=models.CASCADE,related_name="items")
    description=models.CharField(max_length=255)
    quantity=models.PositiveIntegerField(default=1)
    unit_price=models.DecimalField(max_digits=12,decimal_places=2)
    amount=models.DecimalField(max_digits=12,decimal_places=2,default=0)
    def save(self,*args,**kwargs):
        self.amount=self.quantity*self.unit_price; super().save(*args,**kwargs)
