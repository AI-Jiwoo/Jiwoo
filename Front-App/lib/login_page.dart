import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decode/jwt_decode.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  String _email = '';
  String _password = '';
  bool _rememberMe = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadSavedEmail();
  }

  _loadSavedEmail() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _email = prefs.getString('savedEmail') ?? '';
      _rememberMe = _email.isNotEmpty;
    });
  }

  Future<void> _login() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        final response = await http.post(
          // Uri.parse('http://10.0.2.2:5000/login'), // Android 에뮬레이터용
          Uri.parse('http://localhost:5000/login'), // iOS 시뮬레이터용
          headers: <String, String>{
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: jsonEncode(<String, String>{
            'email': _email,
            'password': _password,
          }),
        ).timeout(Duration(seconds: 10)); // 10초 타임아웃 설정

        if (response.statusCode == 200) {
          final token = response.headers['authorization'];
          if (token != null && token.startsWith('Bearer ')) {
            final jwt = token.substring(7);
            final decodedToken = Jwt.parseJwt(jwt);

            // Save tokens
            SharedPreferences prefs = await SharedPreferences.getInstance();
            await prefs.setString('access-token', jwt);
            await prefs.setString('refresh-token', jwt);

            // Save email if remember me is checked
            if (_rememberMe) {
              await prefs.setString('savedEmail', _email);
            } else {
              await prefs.remove('savedEmail');
            }

            // Navigate to home page
            Navigator.of(context).pushReplacementNamed('/home');
          } else {
            throw Exception('Invalid token received');
          }
        } else {
          throw Exception('Login failed: ${response.statusCode} - ${response.body}');
        }
      } catch (e) {
        print('Login error: $e'); // 콘솔에 에러 출력
        String errorMessage = '로그인 실패: ';
        if (e is TimeoutException) {
          errorMessage += '서버 응답 시간 초과';
        } else if (e is SocketException) {
          errorMessage += '네트워크 연결 오류';
        } else {
          errorMessage += e.toString();
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMessage)),
        );
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text('로그인', style: Theme.of(context).textTheme.headlineMedium),                SizedBox(height: 48),
                TextFormField(
                  initialValue: _email,
                  decoration: InputDecoration(labelText: '이메일'),
                  validator: (value) => value!.isEmpty ? '이메일을 입력해주세요' : null,
                  onChanged: (value) => setState(() => _email = value),
                ),
                SizedBox(height: 24),
                TextFormField(
                  obscureText: true,
                  decoration: InputDecoration(labelText: '비밀번호'),
                  validator: (value) => value!.isEmpty ? '비밀번호를 입력해주세요' : null,
                  onChanged: (value) => setState(() => _password = value),
                ),
                SizedBox(height: 24),
                Row(
                  children: [
                    Checkbox(
                      value: _rememberMe,
                      onChanged: (value) => setState(() => _rememberMe = value!),
                    ),
                    Text('아이디 저장'),
                    Spacer(),
                    TextButton(
                      child: Text('아이디 찾기'),
                      onPressed: () {/* TODO: Implement */},
                    ),
                    Text('|'),
                    TextButton(
                      child: Text('비밀번호 찾기'),
                      onPressed: () {/* TODO: Implement */},
                    ),
                  ],
                ),
                SizedBox(height: 24),
                ElevatedButton(
                  child: _isLoading ? CircularProgressIndicator() : Text('로그인'),
                  onPressed: _isLoading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 50),
                  ),
                ),
                SizedBox(height: 16),
                OutlinedButton(
                  child: Text('회원가입'),
                  onPressed: () => Navigator.of(context).pushNamed('/join'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: Size(double.infinity, 50),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}