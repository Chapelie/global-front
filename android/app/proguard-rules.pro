# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Uncomment this to preserve the line number information for
# debugging stack traces.
-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# ============================================
# Capacitor - Règles générales
# ============================================
-keep class com.getcapacitor.** { *; }
-keep class * implements com.getcapacitor.Plugin { *; }
-keepclassmembers class * implements com.getcapacitor.Plugin {
    *;
}

# ============================================
# Push Notifications Plugin (@capacitor/push-notifications)
# ============================================
-keep class com.capacitorjs.plugins.pushnotifications.** { *; }
-keepclassmembers class com.capacitorjs.plugins.pushnotifications.** { *; }
-keep class com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin { *; }

# Si tu utilises @capacitor-firebase/messaging ou un autre fork
-keep class com.capacitorjs.plugins.firebase.** { *; }
-keep class io.capawesome.capacitorjs.plugins.firebase.** { *; }

# ============================================
# Permissions Android (nécessaire pour les notifications)
# ============================================
-keep class androidx.core.app.** { *; }
-keep class androidx.core.content.** { *; }
-keep class android.content.pm.** { *; }

# ============================================
# Firebase (si utilisé pour les push)
# ============================================
-dontwarn com.google.firebase.**
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# ============================================
# Gson (si utilisé par Firebase/Capacitor)
# ============================================
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer
