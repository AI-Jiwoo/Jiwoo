import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';

class JoinPage extends StatefulWidget {
  @override
  _JoinPageState createState() => _JoinPageState();
}

class _JoinPageState extends State<JoinPage> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;
  bool _termsAgreed = false;
  bool _privacyAgreed = false;
  String _name = '';
  String _email = '';
  String _password = '';
  DateTime? _birthDate;
  bool _isEmailVerified = false;
  bool _isLoading = false;

  Future<void> _checkEmail() async {
    if (_email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('이메일을 입력해주세요.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('http://localhost:5000/auth/exist/email'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': _email}),
      );

      if (response.statusCode == 200) {
        setState(() => _isEmailVerified = true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('사용 가능한 이메일입니다.')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('중복된 이메일입니다. 다른 이메일을 사용해주세요.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('이메일 확인 중 오류가 발생했습니다.')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _signUp() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_isEmailVerified) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('이메일 중복 확인을 해주세요.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      String formattedDate = _birthDate != null
          ? DateFormat('yyyy-MM-dd').format(_birthDate!)
          : '';

      final response = await http.post(
        Uri.parse('http://localhost:5000/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': _name,
          'email': _email,
          'password': _password,
          'birthDate': formattedDate,
        }),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('회원가입이 완료되었습니다.')),
        );
        setState(() => _currentStep = 2); // 가입완료 단계로 이동
      } else {
        throw Exception('회원가입 실패: ${response.body}');
      }
    } catch (e) {
      print('Signup error: $e'); // 콘솔에 에러 출력
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('회원가입 중 오류가 발생했습니다: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildTermsStep() {
    return Column(
      children: [
        CheckboxListTile(
          title: Text('홈페이지 이용약관 동의 (필수)'),
          value: _termsAgreed,
          onChanged: (value) => setState(() => _termsAgreed = value!),
        ),
        Container(
          height: 100,
          child: SingleChildScrollView(
            child: Text('이용약관 내용...'), // 실제 약관 내용으로 대체
          ),
        ),
        CheckboxListTile(
          title: Text('개인정보 이용약관 동의 (필수)'),
          value: _privacyAgreed,
          onChanged: (value) => setState(() => _privacyAgreed = value!),
        ),
        Container(
          height: 100,
          child: SingleChildScrollView(
            child: Text('개인정보 약관 내용...'), // 실제 약관 내용으로 대체
          ),
        ),
        ElevatedButton(
          child: Text('다음단계'),
          onPressed: (_termsAgreed && _privacyAgreed) ? () => setState(() => _currentStep = 1) : null,
        ),
      ],
    );
  }

  Widget _buildInfoStep() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            decoration: InputDecoration(labelText: '이름'),
            validator: (value) => value!.isEmpty ? '이름을 입력해주세요' : null,
            onChanged: (value) => setState(() => _name = value),
          ),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  decoration: InputDecoration(labelText: '이메일'),
                  validator: (value) => value!.isEmpty ? '이메일을 입력해주세요' : null,
                  onChanged: (value) => setState(() {
                    _email = value;
                    _isEmailVerified = false;
                  }),
                ),
              ),
              ElevatedButton(
                child: Text('중복 확인'),
                onPressed: _checkEmail,
              ),
            ],
          ),
          TextFormField(
            decoration: InputDecoration(labelText: '비밀번호'),
            obscureText: true,
            validator: (value) => value!.isEmpty ? '비밀번호를 입력해주세요' : null,
            onChanged: (value) => setState(() => _password = value),
          ),
          TextFormField(
            decoration: InputDecoration(labelText: '생년월일'),
            onTap: () async {
              final date = await showDatePicker(
                context: context,
                initialDate: DateTime.now(),
                firstDate: DateTime(1900),
                lastDate: DateTime.now(),
              );
              if (date != null) {
                setState(() => _birthDate = date);
              }
            },
            readOnly: true,
            controller: TextEditingController(
              text: _birthDate != null
                  ? DateFormat('yyyy-MM-dd').format(_birthDate!)
                  : "",
            ),
            validator: (value) => value!.isEmpty ? '생년월일을 선택해주세요' : null,
          ),
          ElevatedButton(
            child: Text('가입완료'),
            onPressed: _signUp,
          ),
        ],
      ),
    );
  }

  Widget _buildCompletionStep() {
    return Column(
      children: [
        Text('가입이 완료되었습니다!', style: Theme.of(context).textTheme.headlineSmall),
        Text('가입해 주셔서 감사합니다. 더 나은 서비스로 보답하겠습니다.'),
        ElevatedButton(
          child: Text('로그인하기'),
          onPressed: () {
            // 모든 이전 라우트를 제거하고 로그인 페이지로 이동
            Navigator.of(context).pushNamedAndRemoveUntil('/', (Route<dynamic> route) => false);
          },
        ),
      ],
    );
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('회원가입')),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Column(
            children: [
              Stepper(
                currentStep: _currentStep,
                onStepTapped: (step) => setState(() => _currentStep = step),
                steps: [
                  Step(
                    title: Text('약관동의'),
                    content: _buildTermsStep(),
                    isActive: _currentStep >= 0,
                  ),
                  Step(
                    title: Text('회원정보'),
                    content: _buildInfoStep(),
                    isActive: _currentStep >= 1,
                  ),
                  Step(
                    title: Text('가입완료'),
                    content: _buildCompletionStep(),
                    isActive: _currentStep >= 2,
                  ),
                ],
              ),
              if (_isLoading)
                CircularProgressIndicator(),
            ],
          ),
        ),
      ),
    );
  }
}