import React from 'react';

const userContext = React.createContext({
    authenticated: false,
    user: null,
});

export default userContext;