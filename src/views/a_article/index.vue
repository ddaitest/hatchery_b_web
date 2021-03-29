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
        发布新文章
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
          <span>{{ row.create_on | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>

      <el-table-column width="" align="left" label="公告标题">
        <template slot-scope="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column
        width="100px"
        class-name="status-col"
        label="重要程度"
        v-if="Kerrigan"
      >
        <template slot-scope="{ row }">
          <svg-icon
            v-for="n in +row.importance"
            :key="n"
            icon-class="star"
            class="meta-item__icon"
          />
        </template>
      </el-table-column>

      <el-table-column
        width="100px"
        class-name="status-col"
        label="置顶"
        v-if="!Kerrigan"
      >
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.importance"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
            @change="handleChangeImp(row)"
          >
          </el-switch>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter">
            {{ row.status == "published" ? "发布" : "草稿" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" width="120px" label="链接">
        <template slot-scope="{ row }">
          <el-popconfirm :title="row.content_url" icon="el-icon-link">
            <template #reference>
              <el-button size="mini">查看链接</el-button>
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
        <template slot-scope="{ row, $index }">
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(row)"
            :loading="row.edit_loading"
          >
            编辑
          </el-button>
          <el-button
            v-if="row.status != 'published'"
            size="mini"
            type="success"
            @click="handleModifyStatus(row, 'published')"
          >
            发布
          </el-button>
          <el-button
            v-if="row.status != 'draft'"
            size="mini"
            @click="handleModifyStatus(row, 'draft')"
          >
            草稿
          </el-button>
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
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
        label-width="100px"
        style="width: 100%"
      >
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="封面">
          <!-- <Upload v-model="temp.avatar" /> -->
          <!-- http://106.12.147.150:8080/files/upload -->
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
          <el-rate
            v-model="temp.importance"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            :max="3"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="置顶" v-if="!Kerrigan">
          <el-switch
            v-model="temp.importance"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <!-- Service id -->
        <el-form-item label="PAGE" v-if="Kerrigan">
          <el-select
            v-model="temp.service_id"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in serviceIdOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容类型">
          <el-select
            v-model="temp.content_type"
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
        <el-form-item label="外部链接" v-show="temp.content_type === 2">
          <el-input
            v-model="temp.content_url"
            :autosize="{ minRows: 1, maxRows: 4 }"
            type="textarea"
          />
        </el-form-item>
        <!-- 富文本 区域 -->
        <div v-show="temp.content_type === 1" class="margin-left: 50px">
          <wang ref="editor" v-model="temp.content"></wang>
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
  fetchArticleList,
  fetchArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from "@/api/aaa";
import Pagination from "@/components/Pagination";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import wang from "@/components/wang";
import clip from "@/utils/clipboard"; // use clipboard directly
import clipboard from "@/directive/clipboard/index.js";
import Upload from "@/components/Upload/SingleImageA";

const contentTypeOptions = [
  { key: 1, display_name: "图文内容" },
  { key: 2, display_name: "外部链接" },
];

const serviceIdOptions = ["tab1", "tab2", "tab3", "service1", "service2"];

const Kerrigan = false; //自己管理后台

export default {
  name: "NoticePage",
  components: { Pagination, wang, Upload },
  directives: { waves, clipboard },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "info",
        deleted: "danger",
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
      Kerrigan,
      contentTypeOptions,
      serviceIdOptions,
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
        id: undefined,
        title: "",
        status: "published",
        content_type: 1,
        importance: 0,
        content: "",
        content_url: "",
        avatar: "",
        serivice_id: "",
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
    // uploadedImages: {
    //   // getter
    //   get: function () {
    //     return [{ name: "default", url: tmp.avatar }];
    //   },
    //   // setter
    //   set: function (newValue) {
    //     console.log("uploadedImages.setter");
    //     console.log(newValue);
    //     newValue
    //     var names = newValue.split(" ");
    //     this.firstName = names[0];
    //     this.lastName = names[names.length - 1];
    //   },
    // },
  },
  methods: {
    async getList() {
      this.listLoading = true;
      const { data } = await fetchArticleList(this.listQuery);
      const items = data.items;
      this.list = items.map((v) => {
        this.$set(v, "edit_loading", false); // https://vuejs.org/v2/guide/reactivity.html
        return v;
      });
      this.listLoading = false;
      this.total = data.total + 200;
    },
    async handleUpdate(row) {
      row.edit_loading = true;
      this.temp = Object.assign({}, row); // copy obj
      console.log("row.content_type=" + row.content_type);
      if (row.content_type === 1) {
        const { data } = await fetchArticle(row.id);
        this.temp.content = data.content;
      } else {
        this.temp.content_url = row.content;
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
    handleChangeImp(row) {
      this.$message({
        message: "操作Success",
        type: "success",
      });
    },
    handleModifyStatus(row, status) {
      // TODO API
      this.$message({
        message: "操作Success",
        type: "success",
      });
      row.status = status;
    },
    handleDelete(row, index) {
      // TODO API
      this.$notify({
        title: "Success",
        message: "Delete Successfully",
        type: "success",
        duration: 2000,
      });
      this.list.splice(index, 1);
    },

    resetTemp() {
      this.temp = {
        id: undefined,
        title: "",
        avatar: "",
        importance: 1,
        content: "",
        content_html: "",
        content_url: "",
        content_type: 1,
        serivice_id: "",
        status: "published",
      };
    },
    createData() {
      //TODO API
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
    handleCopy(text, event) {
      clip(text, event);
    },
    clipboardSuccess() {
      this.$message({
        message: "Copy successfully",
        type: "success",
        duration: 1500,
      });
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
