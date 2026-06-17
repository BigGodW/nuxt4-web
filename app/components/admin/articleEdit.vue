<template>
  <div class="article-form" style="width:90%;margin:2rem auto;">
    <h2>新增文章</h2>

    <div class="form-item" style="margin:12px 0;">
      <label>文章标题</label>
      <input
        v-model="form.title"
        style="width:100%;padding:8px;margin-top:4px;font-size:16px;"
        placeholder="请输入文章标题"
      />
    </div>
    <div class="form-item" style="margin:12px 0;">
      <label>分类</label>
      <select v-model.number="form.categoryId" style="width:100%;padding:8px;margin-top:4px;">
        <option value="">请选择分类</option>
        <option v-for="c in categoryList" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div class="form-item" style="margin:12px 0;">
      <label>标签（多选）</label>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;">
        <label v-for="tag in tagList" :key="tag.id">
          <input
            type="checkbox"
            v-model.number="form.tagIdList"
            :value="tag.id"
          />
          {{ tag.name }}
        </label>
      </div>
    </div>
    <div class="form-item" style="margin:12px 0;">
      <label>封面图链接（选填）</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input
          v-model="form.cover"
          style="flex:1;padding:8px;margin-top:4px;"
          placeholder="图片网络地址"
        />
        <input type="file" ref="coverFileRef" accept="image/*" style="display:none;" @change="uploadCover"/>
        <button @click="$refs.coverFileRef.click()">上传封面</button>
      </div>
    </div>

    <div class="form-item" style="margin:12px 0;">
      <label>发布状态</label>
      <select v-model.number="form.status" style="padding:6px;margin-left:8px;">
        <option value="1">正常发布</option>
        <option value="0">草稿</option>
        <option value="2">下架</option>
      </select>
    </div>
    <div class="form-item" style="margin:16px 0;">
      <label>文章正文</label>
      <WangEditor v-model="form.content" />
    </div>
  

    <button
      @click="submit"
      style="padding:10px 30px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;"
    >
      提交保存文章
    </button>

    <p style="color:red;margin-top:10px;" v-if="errMsg">{{ errMsg }}</p>
  </div>
</template>
<script setup>



</script>