import { nextTick, Ref, ref, unref } from 'vue'
import { VbenFormProps } from '../type'
import { error } from '../../../index'

export interface formMethod {
  // reload: () => void
  setProps: (props: VbenFormProps) => void
  validate: (
    validateCallback?: (errors?: Array<any>) => void,
    shouldRuleBeApplied?: boolean,
  ) => Promise<void>
  getFieldValue: () => Ref
  restoreValidation: () => void
}

export function useForm(props: VbenFormProps) {
  const formRef = ref<Nullable<formMethod>>(null)

  function register(instance) {
    formRef.value = instance
    instance.setProps(props)
  }
  async function getInstance(): Promise<formMethod> {
    const form = unref(formRef)
    if (!form) {
      error('表单实例不存在')
    }
    await nextTick()
    return form as formMethod
  }
  const methods: formMethod = {
    // reload: () => getInstance().reload,
    setProps: async () => (await getInstance()).setProps,
    getFieldValue: () => {
      return unref(formRef)?.getFieldValue() as Ref
    },
    validate: async (
      validateCallback?: (errors?: Array<any>) => void,
      shouldRuleBeApplied?: boolean,
    ): Promise<any> => {
      const form = await getInstance()
      console.log(form)
      return form.validate(validateCallback, shouldRuleBeApplied)
    },
    restoreValidation: async () => {
      const form = await getInstance()
      return form.restoreValidation()
    },
  }
  return [register, methods]
}
