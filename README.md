# Using

```javascript
const cronInterval = "*/1 * * * *"; //[optional] default = '0 */6 * * *'  
require("quite-update")(cronInterval, (err, res)=>{
    if (err || res.status < 0){
        return console.error(err, res && res.status);
    }
    console.log(res)
});
```