<template>
  <div class="advert">
    <el-container>
      <el-aside width="200px">
        <app-aside></app-aside>
      </el-aside>
      <el-container>
        <el-header>Header</el-header>
        <el-main>Main
          <!-- 路由出口 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AppAside from './components/app-aside.vue'
export default Vue.extend({
  name: 'LayoutIndex',
  components: {
    AppAside
  }
})
</script>

<style lang="scss" scoped>
.el-container {
  min-height: 100vh;
}

.el-aside {
  position: sticky;
  top: 0;
  max-height: 100vh;
  background: #d3dce6;
}

.el-header {
  background: #f8f9fb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.el-main {
  background: #e9eef3;
}
</style>
