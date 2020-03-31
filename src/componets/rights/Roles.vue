<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="addRoles">添加角色</el-button>
      <el-table stripe border :data="roleList">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdrow', i1===0 ? 'bdtop':'', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  type="primary"
                  @close="removeRightById(scope.row, item1)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '':'bdtop', 'vcenter']"
                >
                  <el-col :span="7">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row, item2)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="17">
                    <el-tag
                      closable
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
              <!-- 渲染三级权限 -->
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <!-- 操作模块 -->
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialog(scope.row.id)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteDialog(scope.row.id)"
            >删除</el-button>
            <!-- 分配权限按钮 -->
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="applyRights(scope.row)"
              >分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色列表 -->
    </el-card>
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="30%"
      @close="addRolesClosed"
    >
      <el-form ref="addRoleRef" :rules="addRolesRules" :model="addRolesForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesBtn">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色模块 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesDialogVisible" width="30%" @close="editClose">
      <el-form ref="editRoleRef" :rules="editRolesRules" :model="editRolesForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesBtn()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="applyRolesDialogVisible" width="30%" @close="clearItems">
      <el-tree
        :data="rightsList"
        show-checkbox
        :props="treeProps"
        default-expand-all
        node-key="id"
        ref="treeRef"
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="applyRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="applyRolesBtn()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      roleId: '',
      defKeys: [],
      roleList: [],
      rightsList: [],
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改表单列表
      editRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      addRolesDialogVisible: false,
      editRolesDialogVisible: false,
      // 添加表单的预验证
      addRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 25, message: '长度在 3 到 25 个字符', trigger: 'blur' }
        ]
      },
      // 修改表单的预验证
      editRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 25, message: '长度在 3 到 25 个字符', trigger: 'blur' }
        ]
      },
      // 控制分配权限对话框的显示与隐藏
      applyRolesDialogVisible: false
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获得角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      this.roleList = res.data
    },
    // tree的递归函数获得角色下的三级权限Id,并且保存到数组,如果没有节点，那么就是三级节点
    getLeafKeys(node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 确定分配所有的权限
    async applyRolesBtn() {
      const Keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const strId = Keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: strId })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.getRoleList()
      this.applyRolesDialogVisible = false
    },
    // 关闭分配权限对话框
    clearItems() {
      this.defKeys = []
    },
    // 修改分配权限
    async applyRights(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.rightsList = res.data
      // 递归获取三级节点
      this.getLeafKeys(role, this.defKeys)
      this.applyRolesDialogVisible = true
    },
    // 修改角色
    async editDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      console.log(res)
      this.editRolesDialogVisible = true
      this.editRolesForm = res.data
    },
    // 修改角色之后确定
    editRolesBtn() {
      this.$refs.editRoleRef.validate(async valid => {
        if (!valid) return
        console.log(this.editRolesForm)
        const { data: res } = await this.$http.put('roles/' + this.editRolesForm.roleId, this.editRolesForm)
        this.editRolesDialogVisible = false
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        this.getRoleList()
      })
    },
    // 添加角色之后关闭对话框
    addRolesClosed() {
      this.$refs.addRoleRef.resetFields()
    },
    // 关闭修改对话框
    editClose() {
      this.$refs.editRoleRef.resetFields()
    },
    // 删除角色
    async deleteDialog(id) {
      const result = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.getRoleList()
    },
    // 移除权限
    async removeRightById(role, right) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${right.id}`)
      role.children = res.data
    },
    // 确定添加角色列表
    async addRolesBtn() {
      const { data: res } = await this.$http.post('roles', {
        roleName: this.addRolesForm.roleName,
        roleDesc: this.addRolesForm.roleDesc
      })
      this.addRoleForm = res.data
      console.log(res)
      this.addRolesDialogVisible = false
      this.getRoleList()
    },
    addRoles() {
      this.addRolesDialogVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 30px;
}
.el-tag {
  margin: 10px 10px;
}
.bdrow {
  border-bottom: 1px solid #eee;
}
.bdtop {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
