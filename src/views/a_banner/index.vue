// 页面共用。物业端没有 优先级，serviceID 只有2个可选。
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
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" class-name="status-col" label="展示分类">
        <template slot-scope="{ row }">
          <span>{{ filterOption(row.service_id) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        width="100px"
        class-name="status-col"
        label="重要程度"
        v-if="Kerrigan"
      >
        <template slot-scope="{ row }">
          <span>{{ row.top_flag }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column
        width="100px"
        class-name="status-col"
        label="置顶"
        v-if="!Kerrigan"
      >
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.top_flag"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
            @change="handleChangeImp(row)"
          >
          </el-switch>
        </template>
      </el-table-column> -->

      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter">
            {{ row.status == "1" ? "可用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" width="120px" label="链接">
        <template slot-scope="{ row }">
          <el-popconfirm :title="row.redirect_url" icon="el-icon-link">
            <template #reference>
              <el-button
                size="mini"
                @click="handleCopy(row.redirect_url, $event)"
                >查看链接</el-button
              >
            </template>
          </el-popconfirm>
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
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>

        <el-form-item label=" ">
          <el-alert
            title="可以设置链接 或者 上传图片"
            type="info"
            left
            show-icon
          />
        </el-form-item>

        <el-form-item label="封面链接">
          <el-input v-model="temp.avatar" />
        </el-form-item>

        <el-form-item label="上传封面">
          <el-upload
            action="http://106.12.147.150:8080/files/upload/"
            list-type="picture-card"
            :file-list="uploadedImages"
            :on-success="handleUploadImage"
            :on-remove="handleRemoveImage"
            :before-upload="beforeUploadImage"
            :multiple="false"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>

        <el-form-item label="重要程度" v-if="Kerrigan">
          <el-input v-model="temp.top_flag" />
        </el-form-item>
        <!-- <el-form-item label="置顶" v-if="!Kerrigan">
          <el-switch
            v-model="temp.top_flag"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item> -->
        <!-- Service id -->
        <el-form-item label="展示分类">
          <el-select
            v-model="temp.service_id"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in serviceIdOptions"
              :key="item.key"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容类型">
          <el-select
            v-model="temp.contents_type"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in contentTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <!-- 外部链接 -->
        <el-form-item label="外部链接" v-show="temp.contents_type === '1'">
          <el-input
            v-model="temp.redirect_url"
            :autosize="{ minRows: 1, maxRows: 4 }"
            type="textarea"
          />
        </el-form-item>
        <!-- 富文本 区域 -->
        <div v-show="temp.contents_type === '0'" class="margin-left: 50px">
          <wang ref="editor" v-model="temp.contents"></wang>
          <div id="demo1"></div>
        </div>
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
  fetchDetail,
  createObject,
  updateObject,
  deleteObject,
} from "@/api/a_banner";
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
      createLabel: "发布新轮播图",
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
        title: "",
        status: "0",
        contents_type: "0",
        top_flag: "0",
        contents: "",
        redirect_url: "",
        avatar: "",
        service_id: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      rules: {
        type: [
          { required: true, message: "type is required", trigger: "change" },
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" },
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
        avatar: this.temp.avatar,
        title: this.temp.title,
        contents_type: this.temp.contents_type,
        contents:
          this.temp.contents_type === "0"
            ? this.temp.contents
            : this.temp.redirect_url,
        service_id: this.temp.service_id,
        top_flag: this.temp.top_flag,
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
        title: "",
        status: "0",
        contents_type: "0",
        top_flag: "0",
        contents: "",
        redirect_url: "",
        avatar: "",
        service_id: "",
      };
    },
    async createData() {
      this.temp.loading = true;
      const requestData = {
        avatar: this.temp.avatar,
        title: this.temp.title,
        service_id: this.temp.service_id,
        contents_type: this.temp.contents_type,
        contents:
          this.temp.contents_type === "0"
            ? this.temp.contents
            : this.temp.redirect_url,
        top_flag: this.temp.top_flag,
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
