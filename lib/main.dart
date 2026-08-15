import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'screens/splash/splash_screen.dart';
import 'providers/app_provider.dart';
import 'services/websocket_service.dart';
import 'services/polling_service.dart';
import 'services/auth_api_service.dart';
import 'viewmodels/dashboard_viewmodel.dart';
import 'viewmodels/notifications_viewmodel.dart';
import 'viewmodels/cheques_viewmodel.dart';
import 'viewmodels/rh_viewmodel.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'widgets/biometric_lock_wrapper.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('fr', null);
  
  // 🔔 Initialisation OneSignal (Remplacer par ton vrai APP_ID OneSignal)
  OneSignal.Debug.setLogLevel(OSLogLevel.verbose);
  OneSignal.initialize("65944f0a-cb15-46aa-b3b7-63a78c8c33f7");
  OneSignal.Notifications.requestPermission(true);
  
  // Note: PollingService is driven by DashboardViewModel internally — no need to start here
  
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
  ));
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
        Provider(create: (_) => WebSocketService()),
        ChangeNotifierProvider(create: (_) => DashboardViewModel()),
        ChangeNotifierProvider(create: (_) => NotificationsViewModel()),
        ChangeNotifierProvider(create: (_) => ChequesViewModel()),
        ChangeNotifierProvider(create: (_) => RhViewModel()),
      ],
      child: const STBSuperApp(),
    ),
  );
}

class STBSuperApp extends StatefulWidget {
  const STBSuperApp({super.key});

  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  @override
  State<STBSuperApp> createState() => _STBSuperAppState();
}

class _STBSuperAppState extends State<STBSuperApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    // ✅ Écouter les changements de lifecycle de l'app
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    
    // 🔒 Only logout when app is truly terminated (detached), NOT on paused/inactive
    // paused = home button pressed, inactive = notification pulled down / call incoming
    // Logging out on inactive causes logout on every notification — BAD UX!
    if (state == AppLifecycleState.detached) {
      debugPrint('🔒 App terminée — nettoyage session');
      AuthApiService.clearAll();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (context, appProvider, child) {
        return MaterialApp(
          title: 'STB Super-App',
          debugShowCheckedModeBanner: false,
          navigatorKey: STBSuperApp.navigatorKey,
          themeMode: appProvider.themeMode,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          // ✅ Configuration des localisations françaises
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('fr', 'FR'),
            Locale('en', 'US'),
          ],
          locale: const Locale('fr', 'FR'),
          builder: (context, child) {
            return BiometricLockWrapper(child: child ?? const SizedBox.shrink());
          },
          home: const SplashScreen(),
        );
      },
    );
  }
}
