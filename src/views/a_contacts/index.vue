// 物业端专用
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
        {{ createLabel }}
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
      <el-table-column width="180px" align="center" label="发布日期">
        <template slot-scope="{ row }">
          <span>{{ row.create_time | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>

      <el-table-column width="" align="left" label="标题">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column width="" align="left" label="联系方式">
        <template slot-scope="{ row }">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>

      <el-table-column width="" align="left" label="备注">
        <template slot-scope="{ row }">
          <span>{{ row.contents_short }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter">
            {{ row.status == "1" ? "可用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            size="mini"
            @click="handleEdit(row)"
            :loading="row.edit_loading"
          >
            编辑
          </el-button>
          <el-button
            v-if="row.status != '1'"
            size="mini"
            type="success"
            :loading="row.update_loading"
            @click="handleModifyStatus(row, '1')"
          >
            启用
          </el-button>
          <el-button
            v-if="row.status != '0'"
            size="mini"
            :loading="row.update_loading"
            @click="handleModifyStatus(row, '0')"
          >
            禁用
          </el-button>
          <el-button
            v-if="row.status != '2'"
            size="mini"
            type="danger"
            :loading="row.delete_loading"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageIndex"
      :limit.sync="listQuery.page_size"
      @pagination="getList"
    />

    <!-- 新建 or 编辑 对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="100px"
        style="width: 100%"
      >
        <el-form-item label="标题" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
        <el-form-item label="备注" prop="contents_short">
          <el-input v-model="temp.contents_short" />
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
import {
  fetchList,
  createObject,
  updateObject,
  deleteObject,
} from "@/api/a_contact";
import { options, optionSuper, filterOption, Kerrigan } from "@/api/setting";
import Pagination from "@/components/Pagination";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import wang from "@/components/wang";
import clip from "@/utils/clipboard"; // use clipboard directly

const contentTypeOptions = [
  { key: "0", display_name: "图文内容" },
  { key: "1", display_name: "外部链接" },
];

export default {
  components: { Pagination, wang },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: "success",
        0: "info",
        2: "danger",
      };
      return statusMap[status];
    },
    switchFilter(status) {
      const impMap = {
        1: true,
        0: false,
      };
      return impMap[status];
    },
  },
  data() {
    return {
      createLabel: "新建联系方式",
      Kerrigan,
      contentTypeOptions,
      serviceIdOptions: Kerrigan ? optionSuper : options,
      tableKey: 0,
      list: null,
      total: 200,
      listLoading: true,
      listQuery: {
        page_num: 0,
        page_size: 10,
      },
      temp: {
        loading: false,
        id: "",
        name: "",
        phone: "",
        contents_short: "",
        source: "",
        status: "0",
        client_id: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      rules: {
        name: [
          { required: true, message: "name is required", trigger: "blur" },
        ],
        phone: [
          { required: true, message: "phone is required", trigger: "blur" },
        ],
        contents_short: [
          {
            required: true,
            message: "contents_short is required",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  computed: {
    uploadedImages() {
      if (this.temp.avatar.length > 0) {
        return [{ name: "default", url: this.temp.avatar }];
      } else {
        return [];
      }
    },

    pageIndex: {
      get: function () {
        return this.listQuery.page_num + 1;
      },
      set: function (newValue) {
        this.listQuery.page_num = newValue - 1;
      },
    },
  },
  methods: {
    filterOption,
    async getList() {
      this.listLoading = true;
      const { data, total, page_size } = await fetchList(this.listQuery);
      const items = data;
      this.list = items.map((v) => {
        this.$set(v, "edit_loading", false); // https://vuejs.org/v2/guide/reactivity.html
        this.$set(v, "delete_loading", false);
        this.$set(v, "update_loading", false);
        return v;
      });
      this.listLoading = false;
      this.total = total;
    },
    async handleEdit(row) {
      row.edit_loading = true;
      this.temp = Object.assign({}, row); // copy obj
      console.log("row.contents_type=" + row.contents_type);
      if (row.contents_type === "0") {
        const { data } = await fetchDetail(row.id);
        this.temp.contents = data.contents;
      }

      row.edit_loading = false;
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
    // handleChangeImp(row) {
    //   this.$message({
    //     message: "操作成功",
    //     type: "success",
    //   });
    // },
    async handleModifyStatus(row, status) {
      row.update_loading = true;
      const requestData = {
        id: row.id,
        status: status,
      };
      const { data, code, message } = await updateObject(requestData);
      row.update_loading = false;
      if (message === "success") {
        this.$message({
          message: "编辑成功",
          type: "success",
        });
        // this.getList();
      } else {
        this.$message({
          message: "编辑失败: " + message,
          type: "danger",
        });
      }
      row.status = status;
    },
    async updateData() {
      this.temp.loading = true;
      const requestData = {
        id: this.temp.id,
        name: this.temp.name,
        phone: this.temp.phone,
        contents_short: this.temp.contents_short,
        client_id: this.temp.client_id,
        status: this.temp.status,
      };
      const { data, code, message } = await updateObject(requestData);
      this.temp.loading = false;
      if (message === "success") {
        this.$message({
          message: "编辑成功",
          type: "success",
        });
        this.getList();
      } else {
        this.$message({
          message: "编辑失败: " + message,
          type: "danger",
        });
      }
      this.dialogFormVisible = false;
    },
    async handleDelete(row) {
      row.delete_loading = true;
      const { data, code, message } = await deleteObject(row.id);
      row.delete_loading = false;
      if (message === "success") {
        this.$notify({
          message: "删除成功",
          type: "success",
        });
        this.getList();
      } else {
        this.$message({
          message: "删除失败: " + message,
          type: "danger",
        });
      }
    },

    resetTemp() {
      this.temp = {
        loading: false,
        id: "",
        name: "",
        phone: "",
        contents_short: "",
        source: "",
        status: "0",
        client_id: "",
      };
    },
    async createData() {
      this.temp.loading = true;
      const requestData = {
        name: this.temp.name,
        phone: this.temp.phone,
        contents_short: this.temp.contents_short,
        // client_id: "36ff662f-3041-5c10-8bde-65e6fb86523b",
      };
      const { data, code, message } = await createObject(requestData);
      this.temp.loading = false;
      if (message === "success") {
        this.$message({
          message: "创建成功",
          type: "success",
        });
        this.getList();
      } else {
        this.$message({
          message: "创建错误: " + message,
          type: "danger",
        });
      }
      this.dialogFormVisible = false;
    },

    handleCopy(text, event) {
      clip(text, event);
    },
    beforeUploadImage(file) {
      const isJPG = file.type === "image/jpeg";
      const isPNG = file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 12;

      if (!isJPG && !isPNG) {
        this.$message.error("上传头像图片只能是 JPG PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 12MB!");
      }
      return (isJPG || isPNG) && isLt2M;
    },
    handleUploadImage(res, file) {
      this.temp.avatar = res.data;
    },
    handleRemoveImage(file, fileList) {
      this.temp.avatar = "";
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
