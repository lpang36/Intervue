module['exports'] = function echoHttp (hook) {
    console.log(hook.params);
    console.log(hook.req.path);
    console.log(hook.req.method);
    console.log(hook.env);

  	var message = hook.params["text"]; 
};
