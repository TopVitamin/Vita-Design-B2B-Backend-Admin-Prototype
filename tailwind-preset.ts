/**
 * Tailwind preset：与 ui-foundation.css 及《视觉与Token规则V1.1》变量对齐。
 * 重要约定：
 * 1. 不覆盖 Tailwind 原生数字 spacing 刻度，避免 `gap-2`、`p-4` 被误映射成 2px / 4px。
 * 2. 设计 Token 间距通过语义别名暴露，例如 `gap-actions`、`gap-control`、`gap-field`。
 * 3. 壳层相关：`h-header`、`w-sidebar`、`h-tabs`；页面分区相关优先使用 `spacing.page-*` 与语义间距。
 */
const preset = {
  theme: {
    extend: {
      colors: {
        bg: {
          page: "var(--bg-page)",
          container: "var(--bg-container)",
          subtle: "var(--bg-subtle)",
          hover: "var(--bg-hover)",
          active: "var(--bg-active)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
          focus: "var(--border-focus)",
          danger: "var(--border-danger)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
          placeholder: "var(--text-placeholder)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
          subtle: "var(--primary-subtle)",
        },
        success: {
          DEFAULT: "var(--success)",
          subtle: "var(--success-subtle)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          subtle: "var(--warning-subtle)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          subtle: "var(--danger-subtle)",
        },
        info: {
          DEFAULT: "var(--info)",
          subtle: "var(--info-subtle)",
        },
        link: {
          DEFAULT: "var(--link)",
          hover: "var(--link-hover)",
          visited: "var(--link-visited)",
        },
        tag: {
          draft: "var(--tag-draft-bg)",
          pending: "var(--tag-pending-bg)",
          processing: "var(--tag-processing-bg)",
          success: "var(--tag-success-bg)",
          closed: "var(--tag-closed-bg)",
          cancelled: "var(--tag-cancelled-bg)",
          error: "var(--tag-error-bg)",
        },
      },
      fontSize: {
        "page-title": "var(--font-size-page-title)",
        "section-title": "var(--font-size-section-title)",
        "body-lg": "var(--font-size-body-lg)",
        body: "var(--font-size-body)",
        small: "var(--font-size-small)",
        mini: "var(--font-size-mini)",
      },
      fontWeight: {
        "page-title": "var(--font-weight-page-title)",
        "section-title": "var(--font-weight-section-title)",
        "body-strong": "var(--font-weight-body-strong)",
        body: "var(--font-weight-body)",
        tag: "var(--font-weight-tag)",
      },
      lineHeight: {
        "ui-tight": "var(--line-height-tight)",
        "ui-normal": "var(--line-height-normal)",
        "ui-relaxed": "var(--line-height-relaxed)",
        table: "var(--line-height-table)",
      },
      spacing: {
        control: "var(--space-8)",
        actions: "var(--space-12)",
        field: "var(--space-16)",
        tabs: "var(--tabs-gap)",
        "page-x": "var(--padding-page-x)",
        "page-y": "var(--padding-page-y)",
        section: "var(--padding-section)",
        "section-tight": "var(--padding-section-tight)",
        modal: "var(--padding-modal)",
        drawer: "var(--padding-drawer)",

        "page-block": "var(--page-block-gap)",
        "page-section": "var(--page-section-gap)",
        "page-title-gap": "var(--page-title-gap)",
        "filter-gap": "var(--filter-section-gap)",
        "toolbar-gap": "var(--toolbar-gap)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
      },
      height: {
        "header": "var(--layout-header-height)",
        "sticky-footer": "var(--sticky-footer-height)",

        "btn-sm": "var(--button-height-sm)",
        "btn-md": "var(--button-height-md)",
        "btn-lg": "var(--button-height-lg)",

        "input-sm": "var(--input-height-sm)",
        "input-md": "var(--input-height-md)",
        "input-lg": "var(--input-height-lg)",

        "table-header": "var(--table-header-height)",
        "table-row-compact": "var(--table-row-height-compact)",
        "table-row-default": "var(--table-row-height-default)",

        tag: "var(--tag-height)",
        tabs: "var(--tabs-height)",
      },
      width: {
        sidebar: "var(--layout-sidebar-width)",
        "sidebar-collapsed": "var(--layout-sidebar-collapsed-width)",
        "drawer-sm": "var(--drawer-width-sm)",
        "drawer-md": "var(--drawer-width-md)",
        "drawer-lg": "var(--drawer-width-lg)",
        "modal-sm": "var(--modal-width-sm)",
        "modal-md": "var(--modal-width-md)",
        "modal-lg": "var(--modal-width-lg)",
      },
      padding: {
        "btn-sm-x": "var(--button-padding-x-sm)",
        "btn-md-x": "var(--button-padding-x-md)",
        "btn-lg-x": "var(--button-padding-x-lg)",
        "input-x": "var(--input-padding-x)",
        "table-cell-x": "var(--table-cell-padding-x)",
        "table-cell-y": "var(--table-cell-padding-y)",
        "tag-x": "var(--tag-padding-x)",
      },
    },
  },
};

export default preset;
