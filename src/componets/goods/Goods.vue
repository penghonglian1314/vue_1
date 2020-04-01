<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="addCategory">添加分类</el-button>
      <!-- 数据模块 -->
      <tree-table
        :data="categoryList"
        border
        class="treetable"
        show-index
        :show-row-hover="false"
        index-text="#"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
      >
        <template slot-scope="scope" slot="status">
          <i
            style="color: lightgreen"
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i style="color: red" class="el-icon-error" v-else></i>
        </template>
        <template slot-scope="scope" slot="level">
          <el-tag type="success" v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag type="primary" v-else-if="scope.row.cat_level == 1">二级</el-tag>
          <el-tag type="warning" v-else-if="scope.row.cat_level == 2">三级</el-tag>
        </template>
        <template slot-scope="scope" slot="ways">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editCate(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分类区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="newsInfo.pagenum"
        :page-sizes="[3, 8, 12, 15]"
        :page-size="newsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 弹出编辑类 -->
      <el-dialog title="编辑分类信息" :visible.sync="editdialogVisible" width="30%">
        <el-form ref="eidtFormRef" :model="editForm" label-width="80px">
          <el-form-item label="分类名称">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editList">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 弹出添加框 -->
      <el-dialog title="添加分类信息" :visible.sync="addDialogVisible" width="30%" @close="addCateClosed">
        <el-form ref="addFormRef" :model="addCateForm" label-width="80px" :rule="addFormRules">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类 :">
            <el-cascader
              v-model="selectedKeys"
              :props="cascaderProps"
              :options="parentCateList"
              clearable
              @change="parentCateChange"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addList">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: {},
      categoryList: [],
      parentCateList: [],
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // /*选中的id事件  */
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      editdialogVisible: false,
      editForm: {},
      addForm: [],
      addDialogVisible: false,
      newsInfo: {
        pagenum: 1,
        pagesize: 8
      },
      total: 0,
      // treetable的数据
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        type: 'template',
        template: 'status'
      },
      {
        label: '排序',
        type: 'template',
        template: 'level'
      },
      {
        label: '操作',
        type: 'template',
        template: 'ways'
      }]
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 获得数据模块
    async editCate(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      // console.log(res.data)
      this.editForm = res.data
      this.editdialogVisible = true
    },
    // 添加分类
    addCategory() {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    // 关闭事件
    addCateClosed() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 获取父级分类数据的列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.parentCateList = res.data
      console.log(res.data)
    },
    // 确定添加分类
    addList() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入分类名称')
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        console.log(res.data)
        this.getCategoryList()
        this.addDialogVisible = false
      })
    },
    parentCateChange() {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 删除分类数据
    async removeCate(id) {
      // console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该数据, 是否继续?', '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      console.log(confirmResult)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除分类列表失败')
      console.log(res)
      this.getCategoryList()
    },
    // 修改分类数据
    async editList() {
      console.log(this.editForm.cat_name)
      console.log(this.editForm.cat_id)
      const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, this.editForm)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改分类列表失败')
      this.editForm = res.data
      // this.getCategoryList()
      this.editdialogVisible = false
      // console.log(res.data)
    },
    // 获取分类列表
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories', { params: this.newsInfo })
      // console.log(res)
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    // 改变页数的时候
    handleSizeChange(newSize) {
      this.newsInfo.pagesize = newSize
      this.getCategoryList()
    },
    // 改变页码的时候
    handleCurrentChange(newPage) {
      this.newsInfo.pagenum = newPage
      this.getCategoryList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-pagination {
  margin-top: 20px;
}
.el-button {
  margin-bottom: 10px;
}
.el-cascader {
  width: 100%;
}
</style>
