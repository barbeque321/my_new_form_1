from django.contrib import admin

# Register your models here.

from .models import MyModel


class ExampleAdmin(admin.ModelAdmin):
    pass


admin.site.register(MyModel, ExampleAdmin)