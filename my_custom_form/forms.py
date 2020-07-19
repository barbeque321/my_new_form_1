from django import forms
from .models import MyModel


class MyModelForm(forms.ModelForm):
    class Meta:
        fields = ('location', 'location_lat', 'location_lon', )
        model = MyModel
