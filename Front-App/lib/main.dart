import 'package:flutter/material.dart';
import 'login_page.dart';
import 'join_page.dart';  // 새로 만든 JoinPage를 import

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Login App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      initialRoute: '/',  // 초기 라우트 설정
      routes: {
        '/': (context) => LoginPage(),  // 루트 경로를 LoginPage로 설정
        '/home': (context) => HomePage(),
        '/join': (context) => JoinPage(),  // 실제 JoinPage 사용
      },
    );
  }
}

// 임시 HomePage (나중에 실제 홈 페이지로 교체해야 합니다)
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Center(child: Text('Welcome to Home Page')),
    );
  }
}