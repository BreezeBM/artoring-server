const express = require('express');
const router = express.Router();

// 이메일 로그인에 사용합니다.
router.post('/email', () => {});

// facebook 로그인에 요청사용합니다.
router.get('/facebook', () => {});

// facebook 로그인 콜백용 라우팅
router.get('/facebook/callback', () => {});

// 네이버 로그인 요청에 사용합니다.
router.get('/naver', () => {});

// 네이버 로그인 콜백용 라우팅
router.get('/naver/callback', () => {});

// 카카로 로그인 요청에 사용합니다.
router.get('/kakao', () => {});

// 카카오 로그인 콜백용 라우팅
router.get('/kakao/callback', () => {});

module.exports = router;
