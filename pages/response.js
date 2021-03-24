import React, { useRef, useEffect } from 'react'
import { Formik, Field, Form } from 'formik'
import firebase from '../components/firebase'
import axios from 'axios'
import ReCAPTCHA from "react-google-recaptcha"
import Link from 'next/link'
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
    </div>
)
const MaskForm = (props) => {
    const recaptcha = useRef(null)



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
                return errors;
            }}
            onSubmit={async (values) => {
                try {
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
                }
                catch (err) {
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
            }) => (
                <Form>
                    <TextField errors={errors} id='postcode' label='รหัสไปรษณีย์' />
                    <RangeInput handleChange={handleChange} handleBlur={handleBlur} values={values} />
                    <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_recaptcha}
                        size="invisible"
                        ref={recaptcha}
                    />
                    <button className='mt-3 btn btn-primary w-100' type="submit">ส่งข้อมูล</button>
                </Form>
            )}

        </Formik>
    )
}

export default function Response() {
    useEffect(() => {
        firebase.auth().signInAnonymously().then(() => {
            console.log('signed in anonymously')
        }).catch((err) => {
            console.log(err)
        })
    })
    return (
        <div className='container pt-5' style={{ maxWidth: 720 }}>
            <h3 className='text-center'>แบบสำรวจการใส่หน้ากากอนามัยในพื้นที่</h3>
            <MaskForm />
            <div className='mt-3 text-center'>
                <Link href='/'>
                    <a className='text-primary'>ดูแผนที่</a>
                </Link>
            </div>
        </div>
    )
}