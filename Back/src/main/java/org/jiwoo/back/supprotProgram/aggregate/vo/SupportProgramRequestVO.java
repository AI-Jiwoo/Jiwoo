package org.jiwoo.back.supprotProgram.aggregate.vo;

import lombok.Getter;

import java.util.List;

@Getter
public class SupportProgramRequestVO {

    private List<SupportData> data;

    @Getter
    public static class SupportData {
        private String biz_supt_bdgt_info;
        private String biz_supt_ctnt;
        private String biz_supt_trgt_info;
        private int biz_yr;
        private String detl_pg_url;
        private String supt_biz_chrct;
        private String supt_biz_intrd_info;
        private String supt_biz_titl_nm;
    }
}
