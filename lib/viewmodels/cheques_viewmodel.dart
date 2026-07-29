import 'package:flutter/material.dart';
import '../services/auth_api_service.dart';

class ChequesViewModel extends ChangeNotifier {
  ChequesViewModel();

  List<dynamic> _chequeRequests = [];
  bool _isLoading = true;
  int selectedSize = 25;
  String selectedType = 'Barré';
  bool _isOrdering = false;
  bool _isScanning = false;
  double scanProgress = 0.0;

  List<dynamic> get chequeRequests => List.unmodifiable(_chequeRequests);
  bool get isLoading => _isLoading;
  bool get isOrdering => _isOrdering;
  bool get isScanning => _isScanning;

  Future<void> load() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await AuthApiService.getMyCheques();
      if (res.isSuccess && res.data != null) {
        _chequeRequests = res.data!;
      }
    } catch (e) {
      debugPrint('Error loading cheques: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  void setSize(int size) {
    selectedSize = size;
    notifyListeners();
  }

  void setType(String type) {
    selectedType = type;
    notifyListeners();
  }

  Future<void> orderCheckbook() async {
    _isOrdering = true;
    notifyListeners();
    try {
      String t = selectedSize == 25 ? '25' : (selectedSize == 50 ? '50' : 'CERTIFIE');
      if (selectedType == 'Certifié') t = 'CERTIFIE';
      
      await AuthApiService.submitChequeRequest(t);
      await load(); // Reload the list
    } catch (e) {
      debugPrint('Error ordering cheque: $e');
    }
    _isOrdering = false;
    notifyListeners();
  }

  Future<void> startScan(VoidCallback onComplete) async {
    _isScanning = true;
    scanProgress = 0;
    notifyListeners();
    for (int i = 0; i <= 100; i += 2) {
      await Future.delayed(const Duration(milliseconds: 40));
      scanProgress = i / 100;
      notifyListeners();
    }
    _isScanning = false;
    notifyListeners();
    onComplete();
  }
}
