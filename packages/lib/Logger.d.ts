declare const Logger: {
    trace: () => string;
    debug: <T extends any[]>(...body: T) => void;
    api: <T_1 extends any[]>(...body: T_1) => void;
    graphql: <T_2 extends any[]>(...body: T_2) => void;
    plugin: <T_3 extends any[]>(...body: T_3) => void;
    cache: <T_4 extends any[]>(...body: T_4) => void;
    rainbow: <T_5 extends any[]>(...body: T_5) => void;
    verbose: <T_6 extends any[]>(...body: T_6) => void;
    error: <T_7 extends any[]>(...body: T_7) => void;
    warning: <T_8 extends any[]>(...body: T_8) => void;
    info: <T_9 extends any[]>(...body: T_9) => void;
    db: <T_10 extends any[]>(...body: T_10) => void;
};
export default Logger;
