import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jiwoo_front_app/main.dart';

void main() {
  testWidgets('Login page test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(MyApp());

    // Verify that the login page is shown
    expect(find.text('로그인'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2)); // 이메일과 비밀번호 입력 필드
    expect(find.byType(ElevatedButton), findsOneWidget); // 로그인 버튼
    expect(find.byType(OutlinedButton), findsOneWidget); // 회원가입 버튼

    // You can add more specific tests here
  });
}