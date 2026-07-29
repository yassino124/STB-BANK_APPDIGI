export class StringUtil {
  static generateReference(prefix: string = 'STB'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  static generateOTP(length: number = 6): string {
    return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
  }

  static maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.replace(/\d(?=\d{4})/g, '*');
  }

  static maskRib(rib: string): string {
    if (rib.length <= 8) return rib;
    return `${rib.substring(0, 8)}****${rib.substring(rib.length - 4)}`;
  }

  static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
