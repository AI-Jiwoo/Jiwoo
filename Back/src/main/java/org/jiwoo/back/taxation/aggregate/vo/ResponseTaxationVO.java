package org.jiwoo.back.taxation.aggregate.vo;

import lombok.*;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ResponseTaxationVO {

    private int status;         //상태코드값(200,404,415, 400, 500)
    private String message;     //응답메시지
    private Object data;        //응답데이터

    public ResponseTaxationVO(HttpStatus status, String message, Object data){
        this.status = status.value();    // HttpStatus enum 타입에서 value라는 int형 상태 코드 값만 추출
        this.message = message;
        this.data = data;
    }
}
