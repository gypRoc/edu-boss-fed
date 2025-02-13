<template>
  <div id="app">
    <!--  根路由出口 -->
    <router-view />
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
// console.log(request, 'request')
axios.get('/front/user/login?phone=15736883185&password=111111&code=1231')
  .then(function (response) {
    // 处理成功情况
    console.log(response)
  })
  .catch(function (error) {
    // 处理错误情况
    console.log(error)
  })
export default Vue.extend({
  name: 'App'
})
</script>
<style lang="scss" scoped>
.text {
  color: $success-color;
}
</style>
