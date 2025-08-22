package com.daepihasan.util;

// null-safe 처리, HTML input 값 체크(checked, selected)
public class CmmUtil {
	public static Long nvl(String str, Long chg_num) {
		Long res;

		if (str == null) {
			res = chg_num;
		} else if (str.equals("")) {
			res = chg_num;
		} else {
			res = Long.valueOf(str);
		}
		return res;
	}

	public static Long nvl(Long num, Long chg_num) {
		Long res;

		if(num == null) {
			res = chg_num;
		} else if(num == 0) {
			res = chg_num;
		} else {
			res = num;
		}
		return res;
	}

	public static Long nvl(Long num) {
		return nvl(num, 0L);
	}

	public static Integer nvl(Integer num, Integer chg_num) {
		Integer res;

		if(num == null) {
			res = chg_num;
		} else if(num == 0) {
			res = chg_num;
		} else {
			res = num;
		}
		return res;
	}

	public static Integer nvl(Integer num) {
		return nvl(num, 0);
	}

	public static String nvl(String str, String chg_str) {
		String res;

		if (str == null) {
			res = chg_str;
		} else if (str.equals("")) {
			res = chg_str;
		} else {
			res = str;
		}
		return res;
	}
	
	public static String nvl(String str){
		return nvl(str,"");
	}
	
	public static String checked(String str, String com_str){
		if(str.equals(com_str)){
			return " checked";
		}else{
			return "";
		}
	}
	
	public static String checked(String[] str, String com_str){
		for(int i=0;i<str.length;i++){
			if(str[i].equals(com_str))
				return " checked";
		}
		return "";
	}
	
	public static String select(String str,String com_str){
		if(str.equals(com_str)){
			return " selected";
		}else{
			return "";
		}
	}
}