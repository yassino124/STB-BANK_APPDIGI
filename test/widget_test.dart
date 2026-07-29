import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:stb_app/providers/app_provider.dart';
import 'package:stb_app/main.dart';

void main() {
  testWidgets('STB app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AppProvider()),
        ],
        child: const STBSuperApp(),
      ),
    );
  });
}
