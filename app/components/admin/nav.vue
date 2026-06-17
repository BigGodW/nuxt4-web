<template>
    <div>
        <div class="collapse collapse-arrow bg-base-100 border border-base-300" v-for="item in navlist">
            <input type="radio" name="my-accordion-1" checked />
            <div class="collapse-title font-semibold">{{item.title}}</div>
            <div class="collapse-content text-sm" >
                <ul v-for="child in item.childlist">
                <NuxtLink :to="child.toSrc">
                    <li>{{ child.title }}</li>
                </NuxtLink>
                </ul>
            </div>
        </div>
        
    </div>
</template>
<script setup>
const navlist = ref([
    {title:"网站信息",childlist:[
        {title:'网站设置',toSrc:'/admin/website',icon:""}
    ]},
    {
        title:'文章管理',
        childlist:[
            {title:'文章列表',toSrc:'/admin/article/list'},
            {title:'发布文章',toSrc:'/admin/article/add'},
            {title:'文章分类',toSrc:'/admin/article/category'},
            {title:'标签管理',toSrc:'/admin/article/tag'},
        ]
    }
])
</script>