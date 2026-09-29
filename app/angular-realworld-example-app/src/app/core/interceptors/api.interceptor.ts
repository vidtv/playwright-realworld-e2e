import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ url: `http://api:3000/api${req.url}` }));
