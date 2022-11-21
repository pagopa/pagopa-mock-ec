import http from 'k6/http';

export function primitive(url, payload, params) {
    return http.post(url, payload, params);
}

