Dim MapToDefaultValue=Function(ByVal value)

  return CType(value, Newtonsoft.Json.Linq.JValue).Value
End Function