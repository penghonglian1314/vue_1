<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 2.为表格准备一个宽高的Dom -->
      <div id="main" style="width:800px;height:600px;"></div>
    </el-card>
  </div>
</template>

<script>
//  1.导入echarts
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  // 这是在渲染之前就会执行的
  created() {},
  //  3. 被渲染完毕之后才会执行，只要执行到这里，说明Dom元素已经被渲染完毕了
  async mounted() {
    var myChart = echarts.init(document.getElementById('main'))
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败')
    }
    //  4. 准备数据跟配置项
    const result = _.merge(res.data, this.options)
    // 5.展示数据
    // 服务器返回的数据是不完整的，所以要跟接口的合并
    myChart.setOption(result)
  },
  methods: {}
}
</script>
<style lang="less" scoped>
</style>
