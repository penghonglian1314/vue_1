<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="30">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserList">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表单区域 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStatus(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteDialog(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="supplyRoles(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addFormdialogVisible" width="50%" @close="addFormClosed">
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        :disable="addFormdialogVisible"
      >
        <!-- 内容主体区域 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFormdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormdialogUserlist()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editFormdialogVisible"
      width="50%"
      @close="editFormClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <!-- 内容主体区域 -->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editFormdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormdialogUserlist()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="supplyFormdialogVisible"
      width="50%"
      @close="supplyFormClosed"
    >
      <div>
        <p>当前的用户 : {{usersInfo.username}}</p>
        <p>当前的角色 : {{usersInfo.role_name}}</p>
        <p>
          分配的新角色 ：
          <el-select v-model="selectRole" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="supplyFormdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="supplyFormlist">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      supplyForm: {
        username: '',
        email: ''
      },
      supplyFormdialogVisible: false,
      usersInfo: {},
      userList: [],
      roleList: [],
      selectRole: '',
      total: 0,
      addFormdialogVisible: false,
      addForm: {
        username: '',
        email: '',
        password: '',
        mobile: ''
      },
      editForm: {},
      // 添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改表单的验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editFormdialogVisible: false
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      // console.log(res.data)
      // this.$message.success('获取用户列表成功')
      this.userList = res.data.users
      this.total = res.data.total
    },
    supplyFormClosed() {
      this.selectRole = ''
      this.userInfo = ''
    },
    // 分配角色按钮
    async supplyRoles(usersInfo) {
      this.usersInfo = usersInfo
      this.supplyFormdialogVisible = true
      const { data: res } = await this.$http.get('roles')
      this.roleList = res.data
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
    },
    async supplyFormlist() {
      if (!this.selectRole) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.usersInfo.id}/role`, {
        rid: this.selectRole
      })
      if (res.meta.status !== 200) return this.$message.error('更新角色列表失败')
      this.getUserList()
      this.supplyFormdialogVisible = false
    },
    // 获取角色列表
    // async getRoleList() {
    //   const { data: res } = await this.$http.get('roles')
    //   this.roleList = res.data
    //   if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
    // },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听page改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 修改状态，监听状态改变事件
    async userStatus(userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户列表失败')
      }
      this.$message.success('修改用户状态成功')
    },
    // 修改表单
    async editDialog(id) {
      this.editFormdialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('修改用户信息失败')
      this.editForm = res.data
    },
    editFormClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息，并且提交
    editFormdialogUserlist() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 预验证通过之后就可以通过后面的请求了
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email, mobile: this.editForm.mobile
        })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('添加用户列表失败')
        this.$message.success('获取用户列表成功')
        this.editFormdialogVisible = false
        this.getUserList()
      })
    },
    addUserList() {
      this.addFormdialogVisible = true
    },
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addFormdialogUserlist() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 预验证通过之后就可以通过后面的请求了
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加用户列表失败')
        this.$message.success('获取用户列表成功')
        this.addFormdialogVisible = false
        this.getUserList()
      })
    },
    // 删除用户信息
    async deleteDialog(id) {
      // const { data: res } = await this.$http.delete('users/' + id)
      // this.
      // this.getUserList()
      // console.log(id)
      // 弹框询问是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户列表失败')
      this.getUserList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-table {
  margin: 20px 20px
}
</style>
