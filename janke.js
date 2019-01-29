// {state:{}, actions:{f}, methods:{f}, functions:{f}, name:anything} -> framework instance
function janke (args) {                                       

  let clean_args = {};                                          const log = [];    

  if ( isObject(args) ) {
    clean_args.state = isObject(args.state) ? args.state : 'no state here';

    clean_args.actions = isObject(args.actions) ? args.actions : 'no actions here';
    clean_args.methods = isObject(args.methods) ? args.methods : 'no methods here';
    clean_args.functions = isObject(args.functions) ? args.functions : 'no functions here';

    clean_args.name = args.name !== undefined ? args.name : 'no name here' ;

  } else {
    clean_args.state = 'no state here';

    clean_args.actions = 'no actions here';
    clean_args.methods = 'no methods here';
    clean_args.functions = 'no functions here';

    clean_args.name = 'no name here';

  };
  
  let meta;
  const newed = this instanceof janke;  
  if (newed) {                                                  log.push({meta: true});
    meta = this;                                              
    meta.log = log;
    meta.state = clean_args.state;
    meta.actions = clean_args.actions;
    meta.methods = clean_args.methods;
    meta.functions = clean_args.functions;
    meta.name = clean_args.name;
  } else {                                                      log.push({meta: false});
    meta = 'no meta here';                                    
  };

  let instance
  with (clean_args) { 
    instance = function me(arg, args) {    // args is used only when passing in functions

      // call to meta method
      if (arg instanceof Array) {                               const new_entry = {arg:copy(arg)};

        if (newed) {
          if (!(meta instanceof janke)) {                       new_entry.you = 'killed meta';
                                                                log.push(new_entry);
            return 'you killed meta';

          } else {
            try {
              const result = meta.meta(...arg);                   new_entry.result = copy(result);
                                                                  log.push(new_entry);
              if (result instanceof Error) {                    
                throw result;
              } else {
                return result;
              };
            } catch (err) {                                       new_entry.error = err;
                                                                  log.push(new_entry);
              throw err;
            };
          };

        } else {                                                new_entry.no = 'meta here';
                                                                log.push(new_entry);
          return meta;
        };


      // return meta object, if it exists
      } else if (arg === 'meta') {                              const new_entry = {};
        if (newed) {                                    
          if (meta instanceof janke) {                          new_entry.meta_copy = copy(meta);
                                                                log.push(new_entry);
            return copy(meta);
          } else {                                              new_entry.meta_reference = meta;
                                                                log.push(new_entry);
            return meta;
          };
        } else {                                                new_entry.no = 'meta here';
                                                                log.push(new_entry);
          return meta;
        };


      // update state directly by passing in partial states
      // return the instance itself for chaining
      } else if (isObject(arg)) {                               const new_entry = {arg:copy(arg)};
        const new_state = update_state(arg, copy(state));       new_entry.old_state = copy(state);
        state = new_state;                                      new_entry.new_state = copy(new_state);
                                                                log.push(new_entry);
        return instance;


      // executes any function passed with first param as state
      //  and expects args to be the additional argument 
      //    (single or payload, up to you)
      //  then updates state with the result
      // used by curried functions
      } else if (arg instanceof Function) {                     const new_entry = {func: arg.toString(), args};
        try {
          const result = arg(copy(state), args);                
          if (result instanceof Error) {                        new_entry.handled_error = result;  
                                                                log.push(new_entry); 
            throw result;                                      

          } else {                                              new_entry.result = result;
                                                                log.push(new_entry);
            return me(result);

          };
        } catch(err) {                                          new_entry.unhandled_error = err;   
                                                                log.push(new_entry);
          throw err;
        };

      // return a copy of the log
      } else if (arg === 'log') {                               const new_entry = {log: copy(log)};
                                                                log.push(new_entry);
        return copy(log);


      // return a copy of the state
      } else if (arg === 'state') {                             const new_entry = {state: copy(state)};
                                                                log.push(new_entry);
        return copy(state);



      // return a copy of the name
      } else if (arg === 'name') {                              const new_entry = {name};
                                                                log.push(new_entry);
        return name;



      // return a reference to all functions, actions, methods
      } else if (arg === 'stories') {                           const new_entry = {stories};
                                                                log.push(new_entry);
        return {actions, methods, functions};



      // free-variable 'this' cache
      //  you can bind your instance to an object
      //  call it with one
      //  or set it as a property in different objects 
      //    for more flexibility
      // caches are logged by reference
      //  since they're temporary and dynamic
      //  it makes sense to know which one was active 
      //  rather than what was in it
      } else if (arg === 'cache') {                             const new_entry = {};
        if (this instanceof Window) {                           new_entry.no = 'cache here';
                                                                log.push(new_entry);
          return 'no cache here';
        } else {                                                
          if ( isObject(args) ) {                               
            Object.assign(this, args);                          new_entry.cache = this;       
                                                                log.push(new_entry);
            return this;  
          } else {                                              new_entry.cache = this;
                                                                log.push(new_entry);
            return this;
          };
        };


      // explicitly nothing
      } else if ( arg === undefined ) {                         const new_entry = {undefined: null};
                                                                log.push(new_entry);
        return null;


      // add a note to the log and return it
      } else {                                                  const new_entry = {note: copy(arg)};
                                                                log.push(new_entry);
        return copy(log);

      };
    };                     

    // allows to insert note into log whenever a thing is done
    //  inserts the note and returns a reference to the instance
    instance.note = function(arg) {                             // no need to log this function
      if ( isObject(arg) ) {                                    // it is logging embodied
        throw new Error('notes can\'t be objects');
      };
      if ( arg instanceof Array ) {
        throw new Error('notes can\'t be arrays');
      };
      if ( arg instanceof Function ) {
        throw new Error('notes can\'t be functions');
      };
      if ( arg === 'state' 
        || arg === 'log' 
        || arg === 'meta' 
        || arg === 'name' 
        || arg === 'cache' 
        || arg === 'stories' ) {
          throw new Error('notes can\'t be key words');
      };
      this(arg);
      return this;
    };

    // sets meta as prototype of an object
    if (newed) {
      instance.enmeta = function(obj) {                         const new_entry = {enmeta: obj};
                                                                log.push(new_entry);
        return Object.setPrototypeOf(obj, meta);                  
      };
    };

    // binding sets the cache on a new copy of the instance
    //  but you want it to share same actions, so inherit
    //  who cares if it's a bit slow
    instance.bind = function(cache) {
      const bound_to_cache = instance.bind(cache);
      const methoded = Object.setPrototypeOf(bound_to_cache, instance);
      return Object.freeze(methoded);
    };

    if ( isObject(args) ) {

      // wraps all actions, functions, methods, curried or bound functions
      //  anywhere anything happens to state, you will know
      function log_wrapper(wrapped, story) {
        return function() {                                     const new_entry = {args:[...arguments]};
                                                                new_entry.story = story;
          const result = wrapped(...arguments);                 new_entry.result = copy(result);
          if (result instanceof Error) {                        new_entry.state = copy(state);
                                                                new_entry.error = result;  
                                                                log.push(new_entry); 
            throw result;                                      

          } else {                                             
            const old_state = copy(state);                      new_entry.old_state = old_state;
            const new_state = update_state(result, old_state);  new_entry.new_state = new_state;
            state = copy(new_state);
                                                                log.push(new_entry);
            return result;
          };
        };
      };

      if ( isObject(args.state) ) {

        // attach a currying method
        instance.state_currier = function(func) {
          if (func instanceof Function) {
            function to_wrap() {
              return func(state)(...arguments);
            };
            return log_wrapper(to_wrap, 'something curried'); 
          } else {
            throw new Error('can only curry functions');
          };
        };

        instance.state_binder = function(func) {
          if (func instanceof Function) {
            function to_wrap() {
              return func.bind(state)(...arguments);   
            };
            return log_wrapper(to_wrap, 'something bound');
          } else {
            throw new Error('can only bind functions');
          };
        };

      };

      if ( isObject(args.functions) ) {
        // attach pure functions
        for (const _function in functions) {
          if (functions[_function] instanceof Function) {
            const story = _function;
            const functionow = functions[_function];
            const to_wrap = functionow.bind(null, state)
            instance[_function] = log_wrapper(to_wrap, story);
          };
        };
      };

      if ( isObject(args.actions) ) {
        // attach action curriers
        for (const action in actions) {
          if (actions[action] instanceof Function) {
            const actionow = actions[action](state);
            const story = action;
            // cant be arrow function for 'this' reasons
            function to_wrap() {
              return actionow(...arguments);
            };
            instance[action] = log_wrapper(to_wrap, story);
          };
        };
      };

      if ( isObject(args.methods) ) {
        // attach bound methods
        for (const method in methods) {
          if (methods[method] instanceof Function) {
            const story = method;
            function to_wrap() {
              return methods[method].call(state, ...arguments);   
            };
            instance[method] = log_wrapper(to_wrap, story);
          };
        };
      };  

    };  // end if ( isObject(args) ) 

  }; // end with

  // freeze and return instance so it can't be modified later
  return Object.freeze(instance);



  // closed utility functions
    function update_state(result, _state) {
      const new_state = copy(_state)
      if (isObject(result)) {
        const state_keys = Object.keys(new_state);
        for (let key of state_keys) {
          if (result.hasOwnProperty(key)) {
              new_state[key] = result[key];
          };
        }
        return new_state;
      } else { 
        return new_state;
      };
    }
    function copy(thing) {
      if (thing === Object(thing)) {
        return JSON.parse(JSON.stringify(thing));
      } else {
        return thing;
      }
    }
    function isObject(val) {
        if (val === null || typeof val !== 'object') { 
          return false; 
        } else {
          return ( (typeof val === 'function') || (typeof val === 'object') );
        };
    };
};


janke.prototype.word = () => 'word'
janke.prototype.meta = function(pie){
                                return {meta: this, pie, word: this.word()};
                                /* 
                                  passing an array to your app will cause it to call this methods.
                                    the array will be spread into this function
                                  'this' inside here will be set to your app's 'meta' with a property
                                  pointing to state, actions, methods, functions, log & name
                                  as well as access to anything else attached to this prototype

                                  so in this function you can write any meta-script you please so long
                                  as it's functions come in one object payload
                                  simply develop your own meta function and overwrite this one
                                */
                              };



