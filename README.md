# Using

```javascript
const setup = {
	interval: "*/1 * * * *", //[optional] default = '0 */6 * * *'
	strategy: "reset" //do `git reset --hard` or not
};   
require("quite-update")(setup, (err, res)=>{
    if (err || res.status < 0){
        return console.error(err, res && res.status);
    }
    console.log(res)
});
```