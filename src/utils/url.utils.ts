export class UrlUtils {
  static readonly BASE_URL = process.env.BASE_URL || 'http://client:4200';
  static readonly BASE_API_URL = process.env.API_URL || 'http://api:3000/api';
}
