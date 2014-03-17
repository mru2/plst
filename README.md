plst [![Dependency Status](https://gemnasium.com/popox/plst.png)](https://gemnasium.com/popox/plst)
====

Collaborative playlist for parties

Prerequisites 
==
* Nodejs 
* Redis

Run
==

```
npm install
```

then

```
node app.js
```

Use
==

Visit ```localhost:14001``` for the playlist and ```localhost:14001/player.html``` for the player !

Enjoy!


Deploy
==

Using OpenShift, it will go  smoothly! Just follow the instructions.

- Create an account on openshift.com
- Install the OpenShift cli tool ```rhc``` via ```gem install rhc```
- Setup the cli tool with ```rhc setup -l <your_openshift_account_email>```
- Create a new nodejs app ```rhc create-app <app_name> nodejs-0.10 --from-code=git://github.com/popox/plst.git
- Add a redis cartridge ```rhc add-cartridge http://cartreflect-claytondev.rhcloud.com/reflect?github=smarterclayton/openshift-redis-cart -a <app_name>```

That's all folks!
