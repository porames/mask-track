import React, { useRef, useEffect, useState } from 'react'
import { Formik, Field, Form } from 'formik'
import firebase from '../components/firebase'
import axios from 'axios'
import ReCAPTCHA from "react-google-recaptcha"
import Link from 'next/link'
import Modal from 'react-bootstrap/Modal'
import Head from 'next/head'
const TextField = (props) => (
    <div>
        <label htmlFor={props.id}>{props.label}</label>
        <Field type='tel' className='form-control' id={props.id} name={props.id} placeholder={props.label} />
        <div className='mt-2 small text-danger'>{props.errors[props.id]}</div>
    </div>
)
const RangeInput = (props) => (
    <div className='my-3'>
        <label>คะแนนความร่วมมือของคนในพื้นที่</label>
        <div className='d-flex'>
            <div className="checkboxgroup">
                <label htmlFor="score-1">น้อยที่สุด</label>
                <Field type="radio" name="score" id="score-1" value='1' />
            </div>

            <div className="checkboxgroup">
                <label htmlFor="score-2">น้อย</label>
                <Field type="radio" name="score" id="score-2" value='2' />
            </div>
            <div className="checkboxgroup">
                <label htmlFor="score-3">พอใช้</label>
                <Field type="radio" name="score" id="score-3" value='3' />
            </div>
            <div className="checkboxgroup">
                <label htmlFor="score-4">ดี</label>
                <Field type="radio" name="score" id="score-4" value='4' />
            </div>
            <div className="checkboxgroup">
                <label htmlFor="score-5">ดีมาก</label>
                <Field type="radio" name="score" id="score-5" value='5' />
            </div>
        </div>
        <span className='text-danger small'>{props.errors.score}</span>
    </div>
)
const MaskForm = (props) => {
    const { setResponded } = props
    const recaptcha = useRef(null)
    const [modalState, setModalState] = useState(false)

    return (
        <Formik
            initialValues={{
                score: '',
                postcode: ''
            }}
            validate={values => {
                const errors = {};
                if (!values.postcode) {
                    errors.postcode = 'จำเป็นต้องระบุ'
                } else if (/^[0-9]{5}$/.test(values.postcode) === false) {
                    errors.postcode = 'รูปแบบรหัสไปรษณีย์ไม่ถูกต้อง'
                }
                if (!values.score) {
                    errors.score = 'จำเป็นต้องระบุ'
                }
                return errors;
            }}
            onSubmit={async (values) => {
                try {
                    setModalState(true)
                    const token = await recaptcha.current.executeAsync();
                    const userToken = await firebase.auth().currentUser.getIdToken()
                    console.log(userToken)
                    const req = await axios.post('/api/submit', {
                        token: token,
                        postcode: values.postcode,
                        score: values.score
                    }, {
                        headers: {
                            Authorization: userToken
                        }
                    })
                    console.log(req.data)
                    setModalState(false)
                    setResponded(true)
                }
                catch (err) {
                    setModalState(false)
                    setResponded('error')
                    console.log(err)
                }
            }}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                isValid
            }) => (
                <Form>
                    <Modal show={modalState} onHide={() => { }}>
                        <Modal.Header>
                            <Modal.Title>กำลังส่งข้อมูล</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className='container text-center py-3'>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                    <TextField errors={errors} id='postcode' label='รหัสไปรษณีย์' />
                    <RangeInput errors={errors} handleChange={handleChange} handleBlur={handleBlur} values={values} />
                    <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_recaptcha}
                        size="invisible"
                        ref={recaptcha}
                    />
                    <button disabled={!isValid} className='mt-3 btn btn-primary w-100' type="submit">ส่งข้อมูล</button>
                </Form>
            )}

        </Formik>
    )
}

export default function Response() {
    const [responded, setResponded] = useState(false)
    useEffect(() => {
        firebase.auth().signInAnonymously().then(() => {
            console.log('signed in anonymously')
        }).catch((err) => {
            console.log(err)
        })
    })
    return (
        <div className='container pt-5' style={{ maxWidth: 720 }}>
            <Head>
                <title>แบบสำรวจการใส่หน้ากากอนามัยของคนไทย</title>
            </Head>
            <h3 className='text-center'>แบบสำรวจการใส่หน้ากากอนามัยของคนไทย</h3>

            {responded === false &&
                <div>
                    <div className='alert alert-warning my-3'>
                        แบบสำรวจนี้จัดทำโดยนักศึกษามหาวิทยาลัยมหิดล ในรายวิชา มมศท 100 เพื่อนำข้อมูลไปวิเคราะห์ความร่วมมือการใส่หน้ากากอนามัยของคนในพื้นที่ต่าง ๆ ทั่วประเทศไทย
                        ซึ่งจะเป็นประโยชน์ต่อการวางนโยบายควบคุมโรค COVID-19
                    </div>
                    <MaskForm setResponded={setResponded} />
                    <div className='mt-3 text-center'>
                        <Link href='/'>
                            <a className='text-primary'>ดูแผนที่</a>
                        </Link>
                    </div>
                </div>
            }
            {responded === 'error' &&
                <div>
                    <div className='alert text-center mt-4 py-5 alert-danger'>
                        <h4 className='mb-0'>
                            มีข้อผิดพลาดเกิดขึ้น กรุณาตรวจสอบความถูกต้องแล้วลองอีกครั้ง
                        </h4>
                    </div>
                </div>
            }
            {responded === true &&
                <div>
                    <div className='alert text-center mt-4 py-5 alert-secondary'>
                        <h4 className='mb-0'>
                            ได้รับข้อมูลของท่านแล้ว ขอขอบคุณที่ให้ความร่วมมือ
                        </h4>
                    </div>
                </div>
            }
        </div>
    )
}