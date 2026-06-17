# 项目技术栈

- nuxt4 
- prisma 数据库操作
- postgres postgresql数据库
- tailwind css
- qiniu 资源存储

## 部署项目

npm run build

将.env 复制到.output文件夹中
修改.output/server/index.mjs文件

``` 
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const serverDir = dirname(__filename)
const envPath = join(serverDir, '../../.env')

dotenv.config({ path: envPath })
```

读取到.env中的数据
```
DATABASE_URL=""

QINIU_ACCESS_KEY=""
QINIU_SECRET_KEY=""
QINIU_BUCKET=""
QINIU_DOMAIN=""


# JWT加密密钥，项目上线必须更换复杂字符串
JWT_SECRET=""
# token有效期
JWT_EXPIRES=""

```

