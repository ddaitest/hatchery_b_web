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
        发布新公告
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

      <el-table-column width="100px" label="重要程度">
        <template slot-scope="{ row }">
          <svg-icon
            v-for="n in +row.importance"
            :key="n"
            icon-class="star"
            class="meta-item__icon"
          />
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
        <!-- <el-form-item label="公告状态">
          <el-select
            v-model="temp.status"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item label="重要程度">
          <el-rate
            v-model="temp.importance"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            :max="3"
            style="margin-top: 8px"
          />
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
          <!-- <el-form-item>
            <el-alert
              title="设置了链接后，将不再显示文本内容"
              type="success"
            ></el-alert>
          </el-form-item>

          <el-form-item label="文章链接">
            <el-input v-model="temp.content" />
          </el-form-item>
          <el-form-item label="链接操作">
            <el-button @click="dialogFormVisible = false" type="primary">
              新建
            </el-button>
            <el-button @click="dialogFormVisible = false" type="primary">
              编辑
            </el-button>
          </el-form-item> -->
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
  fetchNoticeList,
  fetchNotice,
  createNotice,
  updateNotice,
  deleteNotice,
} from "@/api/aaa";
import Pagination from "@/components/Pagination";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import wang from "@/components/wang";
import clip from "@/utils/clipboard"; // use clipboard directly
import clipboard from "@/directive/clipboard/index.js";

const contentTypeOptions = [
  { key: 1, display_name: "图文内容" },
  { key: 2, display_name: "外部链接" },
];

export default {
  name: "NoticePage",
  components: { Pagination, wang },
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
  },
  data() {
    return {
      contentTypeOptions,
      // statusOptions: ["published", "draft", "deleted"],
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
        importance: 1,
        // create_on: new Date(),
        // update_on: new Date(),
        content: "",
        content_url: "",
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
  methods: {
    async getList() {
      this.listLoading = true;
      const { data } = await fetchNoticeList(this.listQuery);
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
      if (row.content_type === 1) {
        const { data } = await fetchNotice(row.id);
        this.temp.content = data.data.content;
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
        importance: 1,
        content: "",
        content_html: "",
        content_url: "",
        content_type: 1,
        create_on: new Date(),
        update_on: new Date(),
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
      // this.$message({
      //   message: 'handleCopy',
      //   type: 'success',
      //   duration: 1500
      // })
    },
    clipboardSuccess() {
      this.$message({
        message: "Copy successfully",
        type: "success",
        duration: 1500,
      });
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
