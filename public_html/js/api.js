const Api = (() => {
  async function request(method, url, body) {
    const opts = {
      method,
      credentials: 'same-origin',
      headers: {}
    };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || 'Request failed.');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  return {
    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
    patch: (url, body) => request('PATCH', url, body)
  };
})();
