<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新建管理员
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column width="" align="left" label="管理员名称">
        <template slot-scope="{ row }">
          <span>{{ row.username  }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 新建 or 编辑 对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="160px"
        style="width: 100%"
      >
        <el-form-item label="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="temp.avatar" />
        </el-form-item>
        <el-form-item label="addr">
          <el-input v-model="temp.addr" />
        </el-form-item>
        <el-form-item label="mobile">
          <el-input v-model="temp.mobile" />
        </el-form-item>
        <el-form-item label="nick">
          <el-input v-model="temp.nick" />
        </el-form-item>
        <el-form-item label="username" prop="title">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="password" prop="title">
          <el-input v-model="temp.password" />
        </el-form-item>
        <el-form-item label="client_id" prop="title">
          <el-input v-model="temp.client_id" />
        </el-form-item>
      </el-form>
      <el-divider></el-divider>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchManagerList, createManager } from "@/api/aaa";
import Pagination from "@/components/Pagination";
import { parseTime } from "@/utils";

const Kerrigan = true; //自己管理后台

export default {
  name: "NoticePage",
  components: { Pagination },
  directives: {},
  filters: {},
  data() {
    return {
      Kerrigan,
      tableKey: 0,
      list: null,
      total: 200,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
      },
      temp: {
        loading: false,
        id: "",
        email: "",
        avatar: "https://avatars.githubusercontent.com/u/3735867?v=4",
        addr: "",
        mobile: "",
        nick: "",
        username: "",
        password: "",
        client_id: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      rules: {
        title: [
          { required: true, message: "this is required", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    async getList() {
      this.listLoading = true;
      const { data } = await fetchManagerList(this.listQuery);
      const items = data.items;
      this.list = items.map((v) => {
        this.$set(v, "edit_loading", false); // https://vuejs.org/v2/guide/reactivity.html
        return v;
      });
      this.listLoading = false;
      this.total = data.total;
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    resetTemp() {
      this.temp = {
        loading: false,
        id: "",
        email: "",
        avatar: "https://avatars.githubusercontent.com/u/3735867?v=4",
        addr: "",
        mobile: "",
        nick: "",
        username: "",
        password: "",
        client_id: "",
      };
    },
    async createData() {
      const { data } = await createManager(this.temp);
      console.log("createData>>");
      console.log(data);
      this.$message({
        message: "创建成功",
        type: "success",
      });
      this.dialogFormVisible = false;
    },
    updateData() {
      //TODO API
      this.$message({
        message: "更新成功",
        type: "success",
      });
      this.dialogFormVisible = false;
    },
  },
};
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
