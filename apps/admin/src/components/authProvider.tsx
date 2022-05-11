export default {
    login: ({ username, password }: { username: any, password: any }) =>
    {
        const request = new Request(`${process.env.REACT_APP_CPG_DOMAIN}/v1/admin/auth`, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                "Authorization": `Basic ${username}:${password}`
            }),
        });
        return fetch(request)
            .then(response =>
            {
                if (response.status < 200 || response.status >= 300)
                {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(auth =>
            {
                localStorage.setItem('auth', JSON.stringify(auth));
            })
            .catch(() =>
            {
                throw new Error('Network error')
            });
        // localStorage.setItem('username', username);
        // return Promise.resolve();
    },
    logout: () =>
    {
        localStorage.removeItem('auth');
        return Promise.resolve();
    },
    checkError: ({ status }: { status: any }) =>
    {
        if (status === 401 || status === 403)
        {
            localStorage.removeItem('auth');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    checkAuth: () =>
    {
        return localStorage.getItem('auth')
            ? Promise.resolve()
            : Promise.reject();
    },
    getPermissions: () => Promise.resolve(),
};