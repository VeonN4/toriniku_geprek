import 'package:flutter/material.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff6f6f6),
      body: Stack(
        children: [          
          Container(
            height: MediaQuery.of(context).size.height * 0.48,
            decoration: const BoxDecoration(
              color: Color(0xffff6600),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
            ),
          ),
          
          // 2. KONTEN STRUKTUR UTAMA
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        children: [
                          const Text(
                            'Toriniku Geprek',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Selamat datang kembali!',
                        style: TextStyle(
                          color: Color(0xffffe0cc),
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Card LABA HARI INI 
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.1),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'LABA HARI INI',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Rp 370.000',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 36,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              height: 1,
                              color: Colors.white.withOpacity(0.2),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: _buildFinancialInfo(
                                    label: 'Pemasukan',
                                    value: 'Rp 770.000',
                                  ),
                                ),
                                Container(
                                  height: 35,
                                  width: 1,
                                  color: Colors.white.withOpacity(0.3),
                                ),
                                Expanded(
                                  child: _buildFinancialInfo(
                                    label: 'Pengeluaran',
                                    value: 'Rp 400.000',
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Menggunakan Expanded agar mengambil sisa tinggi layar bawah
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      children: [
                        const SizedBox(height: 8),
                        GridView.count(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 1.1,
                          children: [
                            _buildMenuCard(
                              icon: Icons.shopping_bag_outlined,
                              iconColor: const Color(0xff1a73e8),
                              iconBgColor: const Color(0xffe8f0fe),
                              title: 'Order Aktif',
                              value: '2',
                              subtitle: '0 menunggu',
                            ),
                            _buildMenuCard(
                              icon: Icons.layers_outlined,
                              iconColor: const Color(0xff9333ea),
                              iconBgColor: const Color(0xfff3e8ff),
                              title: 'Stok Menipis',
                              value: '0',
                              subtitle: 'item perlu restock',
                            ),
                            _buildMenuCard(
                              icon: Icons.trending_up,
                              iconColor: const Color(0xff00c853),
                              iconBgColor: const Color(0xffe8f5e9),
                              title: 'Total Pemasukan',
                              value: 'Rp 770.000',
                              subtitle: 'semua waktu',
                            ),
                            _buildMenuCard(
                              icon: Icons.trending_down,
                              iconColor: const Color(0xffd50000),
                              iconBgColor: const Color(0xffffebee),
                              title: 'Total Pengeluaran',
                              value: 'Rp 400.000',
                              subtitle: 'semua waktu',
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      
      // Bottom Navigation Bar tetap sama
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xffff6600),
        unselectedItemColor: Colors.grey,
        currentIndex: 0,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Beranda'),
          BottomNavigationBarItem(
            icon: Badge(
              label: const Text('2'),
              backgroundColor: const Color(0xffe53935),
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            label: 'Pesanan',
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.restaurant_menu), label: 'Menu'),
          const BottomNavigationBarItem(icon: Icon(Icons.inventory_2_outlined), label: 'Stok'),
        ],
      ),
    );
  }

  // Helper _buildFinancialInfo dan _buildMenuCard tetap sama seperti kode sebelumnya
  Widget _buildFinancialInfo({required String label, required String value, CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.start}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Column(
        crossAxisAlignment: crossAxisAlignment,
        children: [
          Text(label, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildMenuCard({required IconData icon, required Color iconColor, required Color iconBgColor, required String title, required String value, required String subtitle}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: iconBgColor, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Color(0xff5f6368), fontSize: 14, fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(color: Colors.black38, fontSize: 12)),
            ],
          )
        ],
      ),
    );
  }
}