<template>
  <div class="app-container">
    <div class="filter-container"></div>

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

      <el-table-column width="300px" align="left" label="标题">
        <template slot-scope="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column width="" align="left" label="内容">
        <template slot-scope="{ row }">
          <span>{{ row.contents }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter">
            {{ row.status == "1" ? "可用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" width="120px" label="链接">
        <template slot-scope="{ row }">
          <el-button size="mini" @click="handleCopy(row.redirect_url, $event)">
            查看图片</el-button
          >
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
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, updateObject, deleteObject } from "@/api/a_feedback";
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

    async handleModifyStatus(row, status) {
      row.update_loading = true;
      const { data, code, message } = await updateObject(status, row.id);
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
